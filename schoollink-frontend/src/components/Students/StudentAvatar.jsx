import Avatar from "@mui/material/Avatar";

export default function StudentAvatar({ name }) {

    return (

        <Avatar

            sx={{

                bgcolor: "var(--sl-primary)",

                fontWeight: 700

            }}

        >

            {name?.charAt(0)}

        </Avatar>

    );

}