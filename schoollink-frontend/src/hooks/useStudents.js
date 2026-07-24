import { useEffect, useState } from "react";

import { getStudents } from "../services/studentService";

export default function useStudents() {

    const [students, setStudents] = useState([]);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    useEffect(() => {

        loadStudents();

    }, []);

    async function loadStudents(searchText = "") {

        try {

            setLoading(true);

            const result = await getStudents(searchText);

            if (result.success) {

                setStudents(result.data);

            }

        }

        catch (err) {

            console.error(err);

        }

        finally {

            setLoading(false);

        }

    }

    return {

        students,

        loading,

        search,

        setSearch,

        reload: loadStudents

    };

}