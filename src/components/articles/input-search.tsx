import React from "react";
import {Search} from "lucide-react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";


interface InputSearchProps {
    search: string;
    isDisabled: boolean;
    onResetClick: () => void;
    onChange: (ev: React.ChangeEvent<HTMLInputElement>) => void;
}


export const InputSearch = ({ search, isDisabled, onChange, onResetClick }: InputSearchProps) => {
    return (
        <div className="flex items-center gap-3">
            <div className="relative w-[300px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                <Input
                    type="text"
                    value={search}
                    className="pl-9"
                    onChange={onChange}
                    disabled={isDisabled}
                    placeholder="Search articles..."
                />
            </div>
            {search.length > 0 &&
                <Button size="sm" onClick={onResetClick} disabled={isDisabled}>
                    Cancel
                </Button>
            }
        </div>
    );
}