import CardShell from "./CardShell";

type Props = {
  className?: string;
};

export default function CommunityChatCard({ className }: Props) {
  return (
    <CardShell title="Community Chat" className={className}>
      <div className="h-full overflow-y-auto space-y-2">
        <p><strong>User1:</strong> Can't wait for the new game!</p>
        <p><strong>User2:</strong> Anyone up for a challenge?</p>
        <p><strong>User3:</strong> Loving the updates!</p>
      </div>
    </CardShell>
  );
}
