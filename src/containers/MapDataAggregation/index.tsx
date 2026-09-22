import {useEffect, useState} from 'react';
import {
    Alert,
    Box,
    Button,
    Chip,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    List,
    ListItem,
    ListItemText,
    MenuItem,
    Paper,
    Select,
    SelectChangeEvent,
    TextField,
    Tooltip,
    Typography,
    CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import cronParser from 'cron-parser';

import {useAppDispatch, useAppSelector} from '../../hooks/redux';
import {
    selectScheduleConfigs,
    selectIsLoading,
    selectError,
} from '../../redux/mapDataAggregation/selectors';
import {
    getScheduleConfigs,
    createScheduleConfig,
    deleteScheduleConfig,
} from '../../redux/mapDataAggregation/thunk';

import {OUTBREAK_OPTIONS, OutbreakName} from '../../config/outbreaks';

type ScheduleType = 'rate' | 'cron';

const enum availableRateUnits {minutes = 'minutes', hours = 'hours', days = 'days'}

const validateRateExpression = (value: string): string | null => {
    const numValue = Number.parseInt(value, 10);
    if (Number.isNaN(numValue) || numValue < 1 || numValue > 999) {
        return 'Rate value must be a number between 1 and 999';
    }
    return null;
};

const validateCronExpression = (expression: string): string | null => {
    try {
        cronParser.parse(expression, { strict: true });
        return null;
    } catch (error) {
        return error instanceof Error ? error.message : 'Invalid cron expression';
    }
};

const MapDataAggregation = () => {
    const dispatch = useAppDispatch();
    const scheduleConfigs = useAppSelector(selectScheduleConfigs);
    const isLoading = useAppSelector(selectIsLoading);
    const error = useAppSelector(selectError);

    const [outbreakName, setOutbreakName] = useState<OutbreakName | ''>('');
    const [scheduleType, setScheduleType] = useState<ScheduleType>('rate');
    const [rateValue, setRateValue] = useState('12');
    const [rateUnit, setRateUnit] = useState(availableRateUnits.hours);
    const [cronExpression, setCronExpression] = useState('0 0 * * ? *');
    const [validationError, setValidationError] = useState<string | null>(null);

    useEffect(() => {
        dispatch(getScheduleConfigs());
    }, [dispatch]);

    const buildScheduleExpression = (): string => {
        if (scheduleType === 'rate') {
            const value = Math.max(1, Number.parseInt(rateValue, 10) || 1);
            const unit = value === 1 ? rateUnit.replace(/s$/, '') : rateUnit;
            return `rate(${value} ${unit})`;
        }
        return `cron(${cronExpression})`;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError(null);

        if (!outbreakName) {
            setValidationError('Please select an outbreak name');
            return;
        }

        // Validate schedule expression based on type
        let error: string | null;
        if (scheduleType === 'rate') {
            error = validateRateExpression(rateValue);
        } else {
            error = validateCronExpression(cronExpression);
        }

        if (error) {
            setValidationError(error);
            return;
        }

        dispatch(
            createScheduleConfig({
                scheduleExpression: buildScheduleExpression(),
                outbreakName,
                enabled: true,
            }),
        );
        setOutbreakName('');
        setRateValue('30');
        setRateUnit(availableRateUnits.minutes);
        setCronExpression('0 0 * * ? *');
        setValidationError(null);
    };

    const handleDelete = (id: string) => {
        dispatch(deleteScheduleConfig(id));
    };

    const usedOutbreakNames = new Set(scheduleConfigs.map((c) => c.outbreakName));

    return (
        <Grid container spacing={2}>
            <Grid size={12}>
                <Typography variant="h2" sx={{color: 'text.primary'}}>
                    Map Data Aggregation
                </Typography>
            </Grid>

            {error && (
                <Grid size={12}>
                    <Alert severity="error">{error}</Alert>
                </Grid>
            )}

            {validationError && (
                <Grid size={12}>
                    <Alert severity="error">{validationError}</Alert>
                </Grid>
            )}

            {/* Existing configurations list */}
            <Grid size={12}>
                <Paper sx={{p: '1rem'}}>
                    <Typography variant="h6" gutterBottom>
                        Active Schedule Configurations
                    </Typography>
                    {isLoading && <CircularProgress size={24} />}
                    {scheduleConfigs.length === 0 && !isLoading && (
                        <Typography color="text.secondary">
                            No schedule configurations found.
                        </Typography>
                    )}
                    <List>
                        {scheduleConfigs.map((config) => (
                            <ListItem
                                key={config.id}
                                secondaryAction={
                                    <Tooltip title="Remove configuration">
                                        <IconButton
                                            edge="end"
                                            aria-label="delete"
                                            onClick={() => handleDelete(config.id)}
                                            color="error"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                }
                                sx={{
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 1,
                                    mb: 1,
                                }}
                            >
                                <ListItemText
                                    primary={
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                            <Typography fontWeight="bold">
                                                {config.outbreakName}
                                            </Typography>
                                            <Chip
                                                label={config.enabled ? 'Enabled' : 'Disabled'}
                                                color={config.enabled ? 'success' : 'default'}
                                                size="small"
                                            />
                                        </Box>
                                    }
                                    secondary={
                                        <Typography variant="body2" component="span" display="block">
                                            Schedule: {config.scheduleExpression}
                                        </Typography>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            </Grid>

            {/* Add new configuration form */}
            <Grid size={12}>
                <Paper sx={{p: '1rem'}}>
                    <Typography variant="h6" gutterBottom>
                        Add New Schedule Configuration
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                        <FormControl fullWidth required>
                            <InputLabel id="outbreak-name-label">Outbreak Name</InputLabel>
                            <Select
                                labelId="outbreak-name-label"
                                id="outbreak-name"
                                value={outbreakName}
                                label="Outbreak Name"
                                onChange={(e: SelectChangeEvent) =>
                                    setOutbreakName(e.target.value as OutbreakName)
                                }
                            >
                                {OUTBREAK_OPTIONS.map((opt) => {
                                    const alreadyUsed = usedOutbreakNames.has(opt);
                                    return (
                                        <MenuItem key={opt} value={opt} disabled={alreadyUsed}>
                                            {opt}{alreadyUsed ? ' (already scheduled)' : ''}
                                        </MenuItem>
                                    );
                                })}
                            </Select>
                            {OUTBREAK_OPTIONS.every((opt) => usedOutbreakNames.has(opt)) && (
                                <Typography variant="caption" color="text.secondary" sx={{mt: 0.5, ml: 1.75}}>
                                    All outbreaks already have an active schedule.
                                </Typography>
                            )}
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel id="schedule-type-label">Schedule Type</InputLabel>
                            <Select
                                labelId="schedule-type-label"
                                id="schedule-type"
                                value={scheduleType}
                                label="Schedule Type"
                                onChange={(e: SelectChangeEvent) => {
                                    setScheduleType(e.target.value as ScheduleType);
                                    setValidationError(null);
                                }}
                            >
                                <MenuItem value="rate">Rate</MenuItem>
                                <MenuItem value="cron">Cron</MenuItem>
                            </Select>
                        </FormControl>

                        {scheduleType === 'rate' && (
                            <Box sx={{display: 'flex', gap: 2}}>
                                <TextField
                                    label="Value"
                                    type="number"
                                    value={rateValue}
                                    onChange={(e) => {
                                        const filtered = e.target.value.replace(/[^0-9]/g, '');
                                        setRateValue(filtered);
                                        setValidationError(null);
                                    }}
                                    required
                                    sx={{flex: 1}}
                                    error={scheduleType === 'rate' && validationError !== null}
                                />
                                <FormControl sx={{flex: 1}}>
                                    <InputLabel id="rate-unit-label">Unit</InputLabel>
                                    <Select
                                        labelId="rate-unit-label"
                                        id="rate-unit"
                                        value={rateUnit}
                                        label="Unit"
                                        onChange={(e: SelectChangeEvent) => {
                                            setRateUnit(e.target.value as availableRateUnits);
                                            setValidationError(null);
                                        }}
                                    >
                                        <MenuItem value={availableRateUnits.minutes}>Minutes</MenuItem>
                                        <MenuItem value={availableRateUnits.hours}>Hours</MenuItem>
                                        <MenuItem value={availableRateUnits.days}>Days</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                        )}

                        {scheduleType === 'cron' && (
                            <TextField
                                label="Cron Expression"
                                value={cronExpression}
                                onChange={(e) => {
                                    setCronExpression(e.target.value);
                                    setValidationError(null);
                                }}
                                required
                                fullWidth
                                error={scheduleType === 'cron' && validationError !== null}
                                helperText="Format: minute hour day-of-month month day-of-week year (e.g. 0 0 * * ? *)"
                            />
                        )}

                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isLoading || !outbreakName || usedOutbreakNames.has(outbreakName as OutbreakName) || validationError !== null}
                        >
                            Add Configuration
                        </Button>
                    </Box>
                </Paper>
            </Grid>
        </Grid>
    );
};

export default MapDataAggregation;

