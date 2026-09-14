import api from "./api";

export async function login(identifier, password, remember) {

    const response = await api.post(

        "/auth/login",

        {

            identifier,

            password,

            remember

        }

    );

    return response.data;

}
