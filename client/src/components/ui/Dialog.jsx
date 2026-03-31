import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const DialogContext = React.createContext({
  open: false,
  setOpen: () => {},
})

export function Dialog({ open, onOpenChange, children }) {
  return (
    <DialogContext.Provider value={{ open, setOpen: onOpenChange }}>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-in fade-in duration-200">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
            onClick={() => onOpenChange(false)}
          />
          {children}
        </div>
      )}
    </DialogContext.Provider>
  )
}

export function DialogContent({ children, className }) {
  const { setOpen } = React.useContext(DialogContext)
  return (
    <div className={cn(
      "relative w-full max-w-lg bg-card rounded-3xl shadow-2xl glass p-6 md:p-8 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 z-50 overflow-hidden",
      className
    )}>
      <button 
        onClick={() => setOpen(false)}
        className="absolute left-4 top-4 p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground"
      >
        <X className="w-5 h-5" />
      </button>
      {children}
    </div>
  )
}

export function DialogHeader({ children, className }) {
  return <div className={cn("mb-6 text-right", className)}>{children}</div>
}

export function DialogTitle({ children, className }) {
  return <h2 className={cn("text-2xl font-bold tracking-tight text-slate-900", className)}>{children}</h2>
}

export function DialogDescription({ children, className }) {
  return <p className={cn("text-muted-foreground mt-1 text-sm", className)}>{children}</p>
}

export function DialogFooter({ children, className }) {
  return <div className={cn("mt-8 flex items-center justify-start gap-3", className)}>{children}</div>
}
