import Avatar from "@mui/material/Avatar";

export default function StudentAvatar({ name }) {

    return (

        <Avatar

            sx={{

                bgcolor: "#2563EB",

                fontWeight: 700

            }}

        >

            {name?.charAt(0)}

        </Avatar>

    );

}