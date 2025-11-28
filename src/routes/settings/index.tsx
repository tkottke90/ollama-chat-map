import { BaseProps } from "@/lib/utility-types";
import { X } from "lucide-preact";

type SettingsProps = BaseProps<{

}>

export function SettingsPage({}: SettingsProps) {


  return (
    <div class="w-full h-full">
      <p>Settings</p>
      <a href="/">
        <button>
          <X size={24}/>
        </button>
      </a>
    </div>
  )
}