import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export const ToolTipcomponent = ({warning, children}: {
    warning: string,
    children: React.ReactNode
}) => {
return (
    <Tooltip>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent className="bg-black">
        <p className="text-[#CCFF00]">{warning}</p>
      </TooltipContent>
    </Tooltip>
  )    
}