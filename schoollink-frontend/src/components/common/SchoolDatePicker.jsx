import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import { toUtcDate } from "../../utils/dateUtils";

/**
 * Drop-in replacement for a native <input type="date"> field -
 * same YYYY-MM-DD string in/out (so no other code needs to
 * change), but renders MUI's consistent DatePicker instead of
 * whatever calendar the browser/OS happens to provide.
 */
function SchoolDatePicker({

    label,

    value,

    onChange,

    maxDate,

    minDate,

    required,

    fullWidth,

    size = "medium",

    sx

}) {

    return (

        <DatePicker
            label={label}
            value={value ? toUtcDate(`${value}T00:00:00`) : null}
            onChange={(newValue) => {

                if (!newValue) {

                    onChange("");

                    return;

                }

                const year = newValue.getFullYear();

                const month = String(newValue.getMonth() + 1).padStart(2, "0");

                const day = String(newValue.getDate()).padStart(2, "0");

                onChange(`${year}-${month}-${day}`);

            }}
            maxDate={maxDate}
            minDate={minDate}
            sx={sx}
            slotProps={{

                textField: {

                    size,

                    required,

                    fullWidth

                }

            }}
        />

    );

}

export default SchoolDatePicker;
