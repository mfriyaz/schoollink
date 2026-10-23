const quizModel = require("../models/quiz.model");

const MAX_QUESTIONS = 30;
const DEFAULT_ATTEMPTS = 2;

class QuizError extends Error {
    constructor(message, status = 400) {
        super(message);
        this.status = status;
    }
}

const QTYPES = ["mcq", "tf", "fill"];

/** Lower case, single spaces, no trailing full stop: "  Fifty-Six. " -> "fifty-six" */
const norm = (v) => String(v == null ? "" : v).normalize("NFC").toLowerCase().replace(/\s+/g, " ").trim().replace(/[.\s]+$/, "");

const NUM = /^-?\d+(\.\d+)?$/;

/** Typed answer matches any accepted answer (numbers compare as numbers: 56 = 56.0 = 56.) */
function sameAnswer(given, accepted) {

    const g = norm(given).replace(/,/g, "");

    if (!g) return false;

    return (accepted || []).some((a) => {
        const x = norm(a).replace(/,/g, "");
        if (g === x) return true;
        return NUM.test(g) && NUM.test(x) && Number(g) === Number(x);
    });

}

/** Is this answer right for this question? (server side only) */
function isCorrect(q, v) {

    if (v === null || v === undefined) return false;

    if (q.qtype === "fill") return typeof v === "string" && sameAnswer(v, q.accepted_answers);

    return typeof v === "number" && v === q.correct_index;

}

const text = (v, n) => String(v == null ? "" : v).replace(/\r/g, "").trim().slice(0, n);

/** Check what a teacher sends; throws QuizError with a clear message */
function cleanQuestions(list) {

    if (!Array.isArray(list) || list.length === 0) throw new QuizError("Add at least one question.");
    if (list.length > MAX_QUESTIONS) throw new QuizError(`A quiz can have up to ${MAX_QUESTIONS} questions.`);

    return list.map((q, i) => {

        const n = i + 1;
        const question_text = text(q && q.question_text, 500);
        if (!question_text) throw new QuizError(`Question ${n} is empty.`);

        const qtype = QTYPES.includes(q && q.qtype) ? q.qtype : "mcq";
        const explanation = text(q.explanation, 300);

        if (qtype === "fill") {

            const raw = Array.isArray(q.accepted_answers) ? q.accepted_answers : [];
            const seen = new Set();
            const accepted = [];

            for (const a of raw) {
                const t = text(a, 100);
                if (t && !seen.has(norm(t))) { seen.add(norm(t)); accepted.push(t); }
            }

            if (accepted.length === 0) throw new QuizError(`Question ${n} needs at least one accepted answer.`);
            if (accepted.length > 5) throw new QuizError(`Question ${n} can have up to 5 accepted answers.`);

            return { qtype, question_text, options: [], correct_index: 0, accepted_answers: accepted, explanation };

        }

        if (qtype === "tf") {

            const correct = Number(q.correct_index);
            if (correct !== 0 && correct !== 1) throw new QuizError(`Question ${n} needs True or False as the answer.`);

            return { qtype, question_text, options: ["True", "False"], correct_index: correct, accepted_answers: null, explanation };

        }

        const opts = q && Array.isArray(q.options) ? q.options.map((o) => text(o, 200)) : [];
        if (opts.length !== 4 || opts.some((o) => !o)) throw new QuizError(`Question ${n} needs four answer options.`);
        if (new Set(opts.map((o) => o.toLowerCase())).size !== 4) throw new QuizError(`Question ${n} has two options that are the same.`);

        const correct = Number(q.correct_index);
        if (!Number.isInteger(correct) || correct < 0 || correct > 3) throw new QuizError(`Question ${n} needs one correct answer.`);

        return { qtype: "mcq", question_text, options: opts, correct_index: correct, accepted_answers: null, explanation };

    });

}

async function saveQuiz(homeworkId, schoolId, body) {

    if (!(await quizModel.featureOn(schoolId))) throw new QuizError("Practice quizzes are turned off for your school.", 403);

    const questions = cleanQuestions(body && body.questions);

    let max = Number(body && body.max_attempts);
    if (!Number.isInteger(max)) max = DEFAULT_ATTEMPTS;
    max = Math.min(10, Math.max(1, max));

    const existing = await quizModel.getQuizByHomework(homeworkId);

    if (existing && (await quizModel.countAttempts(existing.id)) > 0) {
        throw new QuizError("Children have already tried this quiz. Remove the quiz first if you really want to replace it (this deletes their results).", 409);
    }

    const quiz = await quizModel.replaceQuiz(homeworkId, max, questions);

    return { id: quiz.id, max_attempts: quiz.max_attempts, question_count: questions.length };

}

/** Teacher / admin view: everything, including the correct answers */
async function getForManage(homeworkId) {

    const quiz = await quizModel.getQuizByHomework(homeworkId);

    if (!quiz) return null;

    const questions = await quizModel.getQuestionsWithAnswers(quiz.id);

    return {
        id: quiz.id,
        max_attempts: quiz.max_attempts,
        closed: Boolean(quiz.closed),
        attempt_count: await quizModel.countAttempts(quiz.id),
        questions
    };

}

/**
 * Delete a quiz. If children have already tried it, the teacher must send confirm = "REMOVE",
 * so results are never lost by one careless tap. Returns how many tries were deleted.
 */
async function removeQuiz(homeworkId, confirm) {

    const quiz = await quizModel.getQuizByHomework(homeworkId);

    if (!quiz) return { attempts: 0, existed: false };

    const attempts = await quizModel.countAttempts(quiz.id);

    if (attempts > 0 && confirm !== "REMOVE") {
        throw new QuizError(`${attempts} ${attempts === 1 ? "try has" : "tries have"} been saved for this quiz. Type REMOVE to confirm deleting the quiz and all results.`, 409);
    }

    await quizModel.deleteQuiz(homeworkId);

    return { attempts, existed: true };

}

/** Close (no new tries, results kept) or reopen a quiz */
async function setClosed(homeworkId, closed) {

    const ok = await quizModel.setClosed(homeworkId, Boolean(closed));

    if (!ok) throw new QuizError("There is no quiz for this homework.", 404);

    return { closed: Boolean(closed) };

}

/** What a parent may see for one child: questions only, plus their own attempts */
async function getForStudent(user, homeworkId, studentId) {

    if (!(await quizModel.featureOn(user.school_id))) return null;

    if (!(await quizModel.parentChildInHomework(user.id, studentId, homeworkId))) {
        throw new QuizError("This homework is not for your child.", 403);
    }

    const quiz = await quizModel.getQuizByHomework(homeworkId);

    if (!quiz) return null;

    const [questions, attempts, rules] = await Promise.all([
        quizModel.getQuestionsForTaking(quiz.id),
        quizModel.getAttempts(quiz.id, studentId),
        quizModel.getHomeworkRules(homeworkId)
    ]);

    const best = attempts.reduce((b, a) => (!b || a.score > b.score ? a : b), null);

    const out = {
        id: quiz.id,
        max_attempts: quiz.max_attempts,
        question_count: questions.length,
        questions,
        attempts: attempts.map((a) => ({ id: a.id, score: a.score, total: a.total, is_late: a.is_late, submitted_at: a.submitted_at })),
        best: best ? { score: best.score, total: best.total } : null,
        attempts_left: Math.max(0, quiz.max_attempts - attempts.length),
        closed: Boolean(quiz.closed),
        open: Boolean(rules && rules.open) && !quiz.closed,
        past_due: Boolean(rules && rules.past_due),
        review: null
    };

    // Answers are shown right after a try (practice quiz): review of the latest attempt
    if (attempts.length) {

        const last = attempts[attempts.length - 1];

        const withAnswers = await quizModel.getQuestionsWithAnswers(quiz.id);

        out.review = {
            attempt_id: last.id,
            score: last.score,
            total: last.total,
            items: withAnswers.map((q) => {
                const chosen = last.answers && last.answers[q.id] !== undefined ? last.answers[q.id] : null;
                return {
                    question_id: q.id,
                    chosen,
                    correct: isCorrect(q, chosen),
                    correct_index: q.qtype === "fill" ? null : q.correct_index,
                    correct_text: q.qtype === "fill" ? (q.accepted_answers || [])[0] || "" : null,
                    explanation: q.explanation || ""
                };
            })
        };

    }

    return out;

}

/** Mark an attempt on the server; the browser never sees the right answers before trying */
async function submitAttempt(user, homeworkId, studentId, rawAnswers) {

    if (!(await quizModel.featureOn(user.school_id))) throw new QuizError("Practice quizzes are turned off for your school.", 403);

    if (!(await quizModel.parentChildInHomework(user.id, studentId, homeworkId))) {
        throw new QuizError("This homework is not for your child.", 403);
    }

    const quiz = await quizModel.getQuizByHomework(homeworkId);

    if (!quiz) throw new QuizError("There is no quiz for this homework.", 404);

    const rules = await quizModel.getHomeworkRules(homeworkId);

    if (quiz.closed || !rules || !rules.open) throw new QuizError("This quiz is closed. Please ask the teacher if you still need to try it.", 403);

    const questions = await quizModel.getQuestionsWithAnswers(quiz.id);

    const given = rawAnswers && typeof rawAnswers === "object" && !Array.isArray(rawAnswers) ? rawAnswers : {};

    const answers = {};
    let score = 0;

    for (const q of questions) {

        const v = given[q.id];

        if (q.qtype === "fill") {

            const t = typeof v === "string" ? v.trim().slice(0, 100) : "";

            if (t) {
                answers[q.id] = t;
                if (isCorrect(q, t)) score++;
            }

            continue;

        }

        const n = v === null || v === undefined || v === "" ? null : Number(v);
        const max = q.qtype === "tf" ? 1 : 3;

        if (n !== null && Number.isInteger(n) && n >= 0 && n <= max) {
            answers[q.id] = n;
            if (isCorrect(q, n)) score++;
        }

    }

    const saved = await quizModel.saveAttempt(quiz, studentId, user.id, answers, score, questions.length, Boolean(rules.past_due));

    if (!saved) throw new QuizError("You have used all the tries for this quiz.", 403);

    return getForStudent(user, homeworkId, studentId);

}

/** Teacher results: who tried, scores, and which questions were missed most on the first try */
async function getResults(homeworkId) {

    const quiz = await quizModel.getQuizByHomework(homeworkId);

    if (!quiz) return null;

    const [questions, data] = await Promise.all([
        quizModel.getQuestionsWithAnswers(quiz.id),
        quizModel.getResults(homeworkId, quiz.id)
    ]);

    const byStudent = new Map();

    for (const a of data.attempts) {
        if (!byStudent.has(a.student_id)) byStudent.set(a.student_id, []);
        byStudent.get(a.student_id).push(a);
    }

    const students = data.students.map((st) => {

        const list = byStudent.get(st.id) || [];
        const best = list.reduce((b, a) => (!b || a.score > b.score ? a : b), null);
        const last = list[list.length - 1] || null;

        return {
            id: st.id,
            name: `${st.first_name || ""} ${st.last_name || ""}`.trim(),
            admission_no: st.admission_no,
            tries: list.length,
            best: best ? { score: best.score, total: best.total } : null,
            last_at: last ? last.submitted_at : null,
            any_late: list.some((a) => a.is_late)
        };

    });

    // first try of each child that attempted
    const firsts = [];
    for (const list of byStudent.values()) firsts.push(list[0]);

    const qstats = questions.map((q, i) => {
        const right = firsts.filter((a) => isCorrect(q, a.answers ? a.answers[q.id] : undefined)).length;
        return { id: q.id, number: i + 1, question_text: q.question_text, qtype: q.qtype, right, total: firsts.length };
    });

    const tried = students.filter((s2) => s2.tries > 0);
    const avg = tried.length
        ? Math.round((tried.reduce((sum, s2) => sum + (s2.best.total ? s2.best.score / s2.best.total : 0), 0) / tried.length) * 100)
        : null;

    return {
        max_attempts: quiz.max_attempts,
        question_count: questions.length,
        summary: { students: students.length, tried: tried.length, average_percent: avg },
        students,
        questions: qstats
    };

}

/** One child's tries with every answer, for the teacher */
async function getStudentDetail(homeworkId, studentId) {

    const quiz = await quizModel.getQuizByHomework(homeworkId);

    if (!quiz) return null;

    const kid = await quizModel.studentInHomework(studentId, homeworkId);

    if (!kid) throw new QuizError("This child is not in this homework's class.", 404);

    const [questions, attempts] = await Promise.all([
        quizModel.getQuestionsWithAnswers(quiz.id),
        quizModel.getAttempts(quiz.id, studentId)
    ]);

    return {
        student: { id: kid.id, name: `${kid.first_name || ""} ${kid.last_name || ""}`.trim() },
        attempts: attempts.map((a, n) => ({
            number: n + 1,
            score: a.score,
            total: a.total,
            is_late: a.is_late,
            submitted_at: a.submitted_at,
            items: questions.map((q, i) => {
                const chosen = a.answers && a.answers[q.id] !== undefined ? a.answers[q.id] : null;
                return {
                    number: i + 1,
                    question_text: q.question_text,
                    qtype: q.qtype,
                    chosen_text: chosen === null ? null : q.qtype === "fill" ? String(chosen) : q.options[chosen],
                    correct: isCorrect(q, chosen),
                    correct_text: q.qtype === "fill" ? (q.accepted_answers || []).join("  |  ") : q.options[q.correct_index]
                };
            })
        }))
    };

}

module.exports = {
    setClosed,
    getStudentDetail,
    getResults, QuizError, saveQuiz, getForManage, removeQuiz, getForStudent, submitAttempt, cleanQuestions };
