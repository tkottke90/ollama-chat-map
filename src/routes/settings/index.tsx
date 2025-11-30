import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BaseProps } from "@/lib/utility-types";
import { Search, X } from "lucide-preact";
import { OllamaConfig } from "./ollama";

type SettingsProps = BaseProps<{

}>

export function SettingsPage({}: SettingsProps) {


  return (
    <div class="max-w-6xl h-full mx-auto text-white p-12">
      <header className="w-full flex justify-between">
        <h2 class="text-4xl font-bold">Settings</h2>
        <a href="/">
          <button className="stroke-current border-current border rounded-full p-2">
            <X size={24}/>
          </button>
        </a>
      </header>

      <br />

      <div className="flex w-full max-w-md items-center gap-2 mx-auto">
        <Input type="Search" placeholder="Search" className="text-lg" />
        <Button type="submit" variant="outline" className="cursor-pointer">
          <Search size={20} />
        </Button>
      </div>

      <br />
      <br />

      <section className="mx-auto">
        <OllamaConfig />
      </section>
      
    </div>
  )
}