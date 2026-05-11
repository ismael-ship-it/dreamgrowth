export function PrototypeModeBanner() {
  return (
    <div className="mb-5 rounded-lg border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <span className="font-bold">Prototype mode:</span> account connections now persist locally,
      but Dashboard, Google, Meta, Weekly Report, and some AI recommendations still use guided
      sample Dream Stoneworks data until live sync is implemented. Use this app for workflow
      operations and operator guidance, not as final reporting truth yet.
    </div>
  );
}
