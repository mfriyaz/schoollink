import api from "./api";

export async function submitGreeting(studentId, voiceUrl) {

    const response = await api.post("/morning-greetings", {

        student_id: studentId,

        voice_url: voiceUrl

    });

    return response.data;

}

export async function getTodaysGreeting(studentId) {

    const response = await api.get(`/morning-greetings/student/${studentId}/today`);

    return response.data;

}

export async function getTodaysGreetingsForClassTeacher() {

    const response = await api.get("/morning-greetings/class-teacher/today");

    return response.data;

}
