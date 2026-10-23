const quizModel = require("../models/quiz.model");

const MAX_QUESTIONS = 30;
const DEFAULT_ATTEMPTS = 2;

class QuizError extends Error {
    constructor(message, status = 400) {
        super(message);
        this.status = status;
    }
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

        const opts = q && Array.isArray(q.options) ? q.options.map((o) => text(o, 200)) : [];
        if (opts.length !== 4 || opts.some((o) => !o)) throw new QuizError(`Question ${n} needs four answer options.`);
        if (new Set(opts.map((o) => o.toLowerCase())).size !== 4) throw new QuizError(`Question ${n} has two options that are the same.`);

        const correct = Number(q.correct_index);
        if (!Number.isInteger(correct) || correct < 0 || correct > 3) throw new QuizError(`Question ${n} needs one correct answer.`);

        return { question_text, options: opts, correct_index: correct, explanation: text(q.explanation, 300) };

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

    return { id: quiz.id, max_attempts: quiz.max_attempts, questions };

}

async function removeQuiz(homeworkId) {

    await quizModel.deleteQuiz(homeworkId);

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
        open: Boolean(rules && rules.open),
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
            items: withAnswers.map((q) => ({
                question_id: q.id,
                chosen: last.answers && last.answers[q.id] !== undefined ? last.answers[q.id] : null,
                correct_index: q.correct_index,
                explanation: q.explanation || ""
            }))
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

    if (!rules || !rules.open) throw new QuizError("This quiz is closed. Please ask the teacher if you still need to try it.", 403);

    const questions = await quizModel.getQuestionsWithAnswers(quiz.id);

    const given = rawAnswers && typeof rawAnswers === "object" && !Array.isArray(rawAnswers) ? rawAnswers : {};

    const answers = {};
    let score = 0;

    for (const q of questions) {

        const v = given[q.id];
        const n = v === null || v === undefined || v === "" ? null : Number(v);

        if (n !== null && Number.isInteger(n) && n >= 0 && n <= 3) {
            answers[q.id] = n;
            if (n === q.correct_index) score++;
        }

    }

    const saved = await quizModel.saveAttempt(quiz, studentId, user.id, answers, score, questions.length, Boolean(rules.past_due));

    if (!saved) throw new QuizError("You have used all the tries for this quiz.", 403);

    return getForStudent(user, homeworkId, studentId);

}

module.exports = { QuizError, saveQuiz, getForManage, removeQuiz, getForStudent, submitAttempt, cleanQuestions };
