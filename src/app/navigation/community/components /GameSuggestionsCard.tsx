import CardShell from "./CardShell";

type Props = {
  className?: string;
};

export default function GameSuggestionsCard({ className }: Props) {
  return (
    <CardShell title="Game Suggestions" className={className}>
      <div className="space-y-2">
        <p>💡 Add new levels</p>
        <p>🎨 Customizable avatars</p>
        <p>🌐 Multiplayer mode</p>
      </div>
    </CardShell>
  );
}
