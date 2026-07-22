import {

    Card,
    CardContent,
    Typography

} from "@mui/material";

function DashboardCard({

    title,

    value,

    color

}) {

    return (

        <Card
            sx={{
                borderLeft: `6px solid ${color}`,
                height: "100%"
            }}
        >

            <CardContent>

                <Typography
                    color="text.secondary"
                >

                    {title}

                </Typography>

                <Typography
                    variant="h3"
                    fontWeight="bold"
                >

                    {value}

                </Typography>

            </CardContent>

        </Card>

    );

}

export default DashboardCard;