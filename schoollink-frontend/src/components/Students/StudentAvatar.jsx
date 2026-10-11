import Avatar from "@mui/material/Avatar";

export default function StudentAvatar({ name }) {

    return (

        <Avatar

            sx={{

                bgcolor: "var(--sl-banner)",

                color: "var(--sl-on-banner)",

                fontWeight: 700

            }}

        >

            {name?.charAt(0)}

        </Avatar>

    );

}