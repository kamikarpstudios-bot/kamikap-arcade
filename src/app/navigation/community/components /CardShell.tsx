type Props = {
  title: string;
  children?: React.ReactNode;
  className?: string;
};

export default function CardShell({ title, children, className }: Props) {
  return (
    <div
      className={`
        flex flex-col h-full rounded-2xl border border-white/10 
        bg-gray-900 backdrop-blur-md p-4
        shadow-lg shadow-white/10
        hover:shadow-white/20
        transition-shadow duration-300
        ${className || ""}
      `}
    >
      {/* Title */}
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/70 font-orbitron">
        {title}
      </h2>

      {/* Content area */}
      <div className="flex-1 min-h-0 text-white/80 text-sm overflow-hidden relative">
        {children || "Placeholder content"}
      </div>
    </div>
  );
}
