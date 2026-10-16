import {FormControl, InputLabel, MenuItem, Select} from "@mui/material";
import {OUTBREAK_OPTIONS, OutbreakName} from "../../config/outbreaks";

interface OutbreakSelectProps {
    /** Unique prefix for the accessibility ids. */
    id: string;
    value: OutbreakName | '';
    onChange: (value: OutbreakName) => void;
    disabled?: boolean;
}

export default function OutbreakSelect({id, value, onChange, disabled}: OutbreakSelectProps) {
    return (
        <FormControl fullWidth>
            <InputLabel id={`${id}-label`}>Outbreak</InputLabel>
            <Select
                labelId={`${id}-label`}
                value={value}
                label="Outbreak"
                onChange={(event) => onChange(event.target.value as OutbreakName)}
                disabled={disabled}
            >
                {OUTBREAK_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}

