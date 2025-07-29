import * as React from 'react';
import { Table } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SlidersHorizontal, X } from 'lucide-react';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchKey: string;
  filterOptions?: {
    columnId: string;
    title: string;
    options: { label: string; value: string }[];
  }[];
}

export function DataTableToolbar<TData>({
  table,
  searchKey,
  filterOptions = [],
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder={`Search ${searchKey}...`}
          value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn(searchKey)?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        
        {filterOptions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto hidden h-8 lg:flex"
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filter
                {isFiltered && (
                  <span className="ml-2 h-4 w-4 rounded-full bg-primary text-xs text-white flex items-center justify-center">
                    {table.getState().columnFilters.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              {filterOptions.map((filter) => (
                <div key={filter.columnId} className="space-y-2 p-2">
                  <DropdownMenuLabel className="text-xs font-medium">
                    {filter.title}
                  </DropdownMenuLabel>
                  {filter.options.map((option) => {
                    const column = table.getColumn(filter.columnId);
                    const isSelected = column?.getFilterValue() === option.value;
                    
                    return (
                      <DropdownMenuCheckboxItem
                        key={option.value}
                        className="text-xs"
                        checked={isSelected}
                        onCheckedChange={() => {
                          if (isSelected) {
                            column?.setFilterValue(undefined);
                          } else {
                            column?.setFilterValue(option.value);
                          }
                        }}
                      >
                        {option.label}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
                  <DropdownMenuSeparator className="my-1" />
                </div>
              ))}
              {isFiltered && (
                <>
                  <DropdownMenuSeparator />
                  <Button
                    variant="ghost"
                    onClick={() => table.resetColumnFilters()}
                    className="w-full justify-center text-xs"
                    size="sm"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Clear filters
                  </Button>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="ml-2 h-8 lg:flex">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            View
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[150px]">
          <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {table
            .getAllColumns()
            .filter(
              (column) =>
                typeof column.accessorFn !== 'undefined' && column.getCanHide()
            )
            .map((column) => {
              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) =>
                    column.toggleVisibility(!!value)
                  }
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              );
            })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
