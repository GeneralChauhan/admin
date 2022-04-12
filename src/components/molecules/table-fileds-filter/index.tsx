import React, { useEffect, useRef, useState } from "react"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"

import PlusIcon from "../../fundamentals/icons/plus-icon"
import Button from "../../fundamentals/button"
import CrossIcon from "../../fundamentals/icons/cross-icon"
import Checkbox from "../../atoms/checkbox"
import { sortBy } from "lodash"

type Field = { id: string; label: React.ReactNode; short: string }

type ChipProps = Field & {
  remove: (id: string) => void
}

function Chip(props: ChipProps) {
  const { remove, short } = props
  return (
    <div className="rounded rounded-lg h-[32px] flex gap-1 items-center px-3 text-small text-grey-70 border border-gray-70">
      {short}
      <CrossIcon
        className="text-grey-40 cursor-pointer"
        onClick={remove}
        size={13}
      />
    </div>
  )
}

type TableFieldsFilterProps = {
  fields: Field[]
  onChange: (selectedFieldIds: string[]) => void
}

type FieldsMenuProps = {
  onClick: () => void
  toggleCheck: (id: string) => void
  fields: Field[]
  selectedFields: string[]
}

function FieldsMenu(props: FieldsMenuProps) {
  const { fields, onClick, toggleCheck, selectedFields } = props
  const [open, setOpen] = useState(false)
  const contentRef = useRef()

  const onTriggerClick = () => {
    setOpen(true)
    onClick()
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!contentRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [contentRef])

  return (
    <DropdownMenu.Root open={open}>
      <DropdownMenu.Trigger>
        <Button
          onClick={onTriggerClick}
          variant="secondary"
          className="rounded rounded-lg h-[32px] px-3 text-small font-semibold text-grey-90"
        >
          Add fields <PlusIcon size={14} />
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content
        ref={contentRef}
        className="w-[240px] bg-white shadow rounded-xl p-2"
      >
        {fields.map((f) => (
          <DropdownMenu.Item key={f.id}>
            <Checkbox
              className="px-[6px] h-[32px] hover:bg-grey-10 rounded text-small"
              checked={selectedFields.includes(f.id)}
              onChange={() => toggleCheck(f.id)}
              label={f.label}
            />
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

function TableFieldsFilters(props: TableFieldsFilterProps) {
  const { fields, onChange } = props

  const [selectedFields, setSelectedFields] = useState<Field["id"][]>([])

  useEffect(() => {
    onChange(selectedFields)
  }, [selectedFields])

  const toggleCheck = (id: string) => {
    if (selectedFields.includes(id)) {
      setSelectedFields(selectedFields.filter((f) => f !== id))
    } else {
      setSelectedFields([...selectedFields, id])
    }
  }

  const removeSelected = (id: string) => {
    setSelectedFields(selectedFields.filter((f) => f !== id))
  }

  const _selected = [...selectedFields]
  _selected.sort()

  return (
    <div className="flex gap-1">
      <div className="flex gap-1">
        {fields
          .filter((f) => selectedFields.includes(f.id))
          .map((f) => (
            <Chip key={f.id} {...f} remove={() => removeSelected(f.id)} />
          ))}
      </div>

      <FieldsMenu
        fields={sortBy(fields, "id")}
        onClick={console.log}
        toggleCheck={toggleCheck}
        selectedFields={selectedFields}
      />
    </div>
  )
}

export default TableFieldsFilters