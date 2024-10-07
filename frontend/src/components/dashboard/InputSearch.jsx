import {LuSearch} from "react-icons/lu";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";


export const InputSearch = ({ search, isDisabled, onChange, onResetClick }) => (
    <div className="flex items-center gap-3">
        <div className="relative w-[300px]">
            <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
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