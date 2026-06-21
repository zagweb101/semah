export default function Loading() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
      <div className="size-6 animate-spin rounded-full border-2 border-muted border-t-foreground" />
    </div>
  );
}
