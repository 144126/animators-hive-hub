
import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface Community {
  id: string
  name: string
  display_name: string
}

interface CommunityComboboxProps {
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
}

export const CommunityCombobox = ({ value, onValueChange, disabled }: CommunityComboboxProps) => {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const { data: communities } = useQuery({
    queryKey: ['communities', searchTerm],
    queryFn: async (): Promise<Community[]> => {
      let query = supabase
        .from('communities')
        .select('id, name, display_name')
        .order('display_name')

      if (searchTerm) {
        query = query.ilike('display_name', `%${searchTerm}%`)
      }

      const { data, error } = await query.limit(50)
      if (error) throw error
      return data || []
    }
  })

  const selectedCommunity = communities?.find(community => community.id === value)

  const getDisplayValue = () => {
    if (value === 'none') return 'No community'
    if (value === 'create-new') return 'Create New Community'
    return selectedCommunity?.display_name || 'Select a community'
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {getDisplayValue()}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput 
            placeholder="Search communities..." 
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            <CommandEmpty>No communities found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="none"
                onSelect={() => {
                  onValueChange('none')
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === 'none' ? "opacity-100" : "opacity-0"
                  )}
                />
                No community
              </CommandItem>
              <CommandItem
                value="create-new"
                onSelect={() => {
                  onValueChange('create-new')
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === 'create-new' ? "opacity-100" : "opacity-0"
                  )}
                />
                <Plus className="mr-2 h-4 w-4" />
                Create New Community
              </CommandItem>
              {communities?.map((community) => (
                <CommandItem
                  key={community.id}
                  value={community.id}
                  onSelect={() => {
                    onValueChange(community.id)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === community.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {community.display_name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
