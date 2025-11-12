'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { Check, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

const SelectContext = createContext(null)

const getChildrenText = (children) => {
  return React.Children.toArray(children)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number") {
        return child
      }
      if (React.isValidElement(child)) {
        return getChildrenText(child.props.children)
      }
      return ""
    })
    .join("")
}

const useSelectContext = () => {
  const context = useContext(SelectContext)
  if (!context) {
    throw new Error("Select components must be used within a <Select> component.")
  }
  return context
}

const Select = ({
  children,
  value,
  defaultValue,
  onValueChange,
  className,
}) => {
  const [open, setOpen] = useState(false)
  const [internalValue, setInternalValue] = useState(defaultValue ?? "")
  const [options, setOptions] = useState({})
  const containerRef = useRef(null)

  const isControlled = value !== undefined
  const selectedValue = isControlled ? value : internalValue

  useEffect(() => {
    if (isControlled) {
      setInternalValue(value ?? "")
    }
  }, [value, isControlled])

  const registerOption = useCallback((optionValue, label) => {
    setOptions((prev) => {
      if (prev[optionValue] === label) return prev
      return { ...prev, [optionValue]: label }
    })
  }, [])

  const handleValueChange = useCallback(
    (newValue) => {
      if (!isControlled) {
        setInternalValue(newValue)
      }
      onValueChange?.(newValue)
    },
    [isControlled, onValueChange]
  )

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const contextValue = useMemo(
    () => ({
      open,
      setOpen,
      selectedValue,
      onSelect: handleValueChange,
      options,
      registerOption,
    }),
    [open, selectedValue, handleValueChange, options, registerOption]
  )

  return (
    <SelectContext.Provider value={contextValue}>
      <div ref={containerRef} className={cn("relative", className)}>
        {children}
      </div>
    </SelectContext.Provider>
  )
}

const SelectTrigger = React.forwardRef(
  ({ className, children, disabled, ...props }, ref) => {
    const { open, setOpen } = useSelectContext()

    return (
      <button
        type="button"
        ref={ref}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm text-left ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        {...props}
      >
        <span className="flex-1 truncate">{children}</span>
        <ChevronDown className={cn("ml-2 h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>
    )
  }
)
SelectTrigger.displayName = "SelectTrigger"

const SelectContent = ({ className, children }) => {
  const { open } = useSelectContext()

  if (!open) return null

  return (
    <div
      className={cn(
        "absolute z-50 mt-2 w-full min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md",
        className
      )}
    >
      <div className="max-h-60 overflow-y-auto py-1">{children}</div>
    </div>
  )
}

const SelectItem = ({ value, children, className }) => {
  const { selectedValue, onSelect, setOpen, registerOption } = useSelectContext()

  useEffect(() => {
    registerOption(value, getChildrenText(children))
  }, [value, children, registerOption])

  const isSelected = selectedValue === value

  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center justify-between px-3 py-2 text-sm text-left transition-colors",
        "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        isSelected && "bg-blue-50 text-blue-700",
        className
      )}
      onClick={() => {
        onSelect(value)
        setOpen(false)
      }}
    >
      <span>{children}</span>
      {isSelected && <Check className="h-4 w-4" />}
    </button>
  )
}

const SelectValue = ({ placeholder = "Select an option", className }) => {
  const { selectedValue, options } = useSelectContext()
  const displayValue = selectedValue && options[selectedValue] ? options[selectedValue] : placeholder

  return (
    <span
      className={cn(
        "block truncate",
        (!selectedValue || !options[selectedValue]) && "text-muted-foreground",
        className
      )}
    >
      {displayValue}
    </span>
  )
}

const SelectLabel = ({ className, children, ...props }) => (
  <div className={cn("px-3 py-1.5 text-xs uppercase text-muted-foreground", className)} {...props}>
    {children}
  </div>
)

const SelectSeparator = ({ className, ...props }) => (
  <div className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />
)

const SelectGroup = ({ className, children, ...props }) => (
  <div className={cn("py-1", className)} {...props}>
    {children}
  </div>
)

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
}


