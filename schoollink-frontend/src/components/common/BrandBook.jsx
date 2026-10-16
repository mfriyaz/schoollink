/**
 * The SchoolLink open-book logo: a white book with a thin dark outline,
 * so it stays clear on every theme colour (including the soft pastel ones).
 */
export default function BrandBook({ size = 24, outline = "#111827" }) {
    return (
        <svg
            width={size}
            height={size * 0.88}
            viewBox="76 88 360 312"
            role="img"
            aria-label="SchoolLink"
            style={{ display: "block" }}
        >
            <g fill="#FFFFFF" stroke={outline} strokeWidth="22" strokeLinejoin="round">
                <path d="M248 130C212 102 150 98 92 116L92 372C150 354 212 358 248 386Z" />
                <path d="M264 130C300 102 362 98 420 116L420 372C362 354 300 358 264 386Z" />
            </g>
        </svg>
    );
}
