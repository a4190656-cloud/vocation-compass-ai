import { useState, type ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";

export function PasswordInput(props: Omit<ComponentProps<typeof Input>, "type">) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={show ? "text" : "password"} className={`${props.className ?? ""} pl-12`} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "הסתרת סיסמה" : "הצגת סיסמה"}
        title={show ? "הסתרת סיסמה" : "הצגת סיסמה"}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
      >
        {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  );
}
