import StatChips from "../common/StatChips";

/** Small count chips; tapping one filters the list. */
export default function StudentStatistics({ students, active, onPick }) {

    const on = students.filter((x) => x.is_active);

    return (
        <StatChips
            active={active}
            onPick={onPick}
            items={[
                { label: "Total", value: students.length, filter: "all" },
                { label: "Active", value: on.length, filter: "active", tone: "#16A34A" },
                { label: "Boys", value: on.filter((x) => x.gender === "Male").length, filter: "boys" },
                { label: "Girls", value: on.filter((x) => x.gender === "Female").length, filter: "girls" }
            ]}
        />
    );
}
