export function PrivacyNotice({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs leading-5 text-slate-500 ${className}`}>
      Demonstration only. This is not a production authentication system.
      Captured face images are sent for a single comparison request and are not
      stored by this app. Biometric data should not be retained longer than needed
      to complete verification.
    </p>
  );
}
