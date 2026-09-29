import {useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {
    Alert,
    Box,
    Button,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    SelectChangeEvent,
    Typography,
} from "@mui/material";

import {S3Folder} from "../../redux/dataDownloads/slice";
import {uploadDataToS3} from "../../redux/dataDownloads/thunk";
import {AppDispatch, RootState} from "../../redux/store";


export default function UploadData() {
    const dispatch = useDispatch<AppDispatch>();
    const { isLoading, error } = useSelector((state: RootState) => state.dataDownloads);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [outbreakName, setOutbreakName] = useState<S3Folder | "">(S3Folder.EbolaBVD);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const outbreakOptions = [S3Folder.EbolaBVD];

    const handleOpenFilePicker = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        setSelectedFile(file);
        setSubmitted(false);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!outbreakName || !selectedFile) return;

        try {
            await dispatch(uploadDataToS3({
                file: selectedFile,
                outbreakName: outbreakName as string
            })).unwrap();
            setSubmitted(true);
        } catch (err) {
            // Error is handled by Redux and displayed in the error state
            console.error('Upload failed:', err);
        }
    };

    return (
        <Grid container spacing={2}>
            <Grid size={12}>
                <Typography variant={'h2'} sx={{color: "text.primary"}}>
                    Upload Data
                </Typography>
            </Grid>

            <Grid size={12}>
                <Paper sx={{p: '1rem'}}>
                    <Typography>
                        Select an outbreak first, then choose the CSV file to upload. The selected file name does not
                        matter; it will be normalized to the expected format and named based on the chosen outbreak.
                    </Typography>
                </Paper>
            </Grid>

            <Grid size={12}>
                <Paper sx={{p: '1rem'}}>
                    <Box component="form" onSubmit={handleSubmit} sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                        <FormControl fullWidth required>
                            <InputLabel id="outbreak-name-label">Outbreak Name</InputLabel>
                            <Select
                                labelId="outbreak-name-label"
                                id="outbreak-name"
                                value={outbreakName}
                                label="Outbreak Name"
                                onChange={(event: SelectChangeEvent) => setOutbreakName(event.target.value as S3Folder)}
                            >
                                {outbreakOptions.map((outbreakOption) => (
                                    <MenuItem key={outbreakOption} value={outbreakOption}>
                                        {outbreakOption}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv,text/csv"
                            onChange={handleFileChange}
                            style={{display: 'none'}}
                        />

                        <Button variant="outlined" onClick={handleOpenFilePicker}>
                            Select CSV File
                        </Button>

                        <Typography color="text.secondary">
                            {selectedFile ? `Selected file: ${selectedFile.name}` : 'No file selected'}
                        </Typography>

                        <Button
                            type="submit"
                            variant="contained"
                            disabled={!outbreakName || !selectedFile || isLoading}
                        >
                            {isLoading ? 'Uploading...' : 'Upload Data'}
                        </Button>

                        {error && (
                            <Alert severity="error">
                                {error}
                            </Alert>
                        )}

                        {submitted && !error && (
                            <Alert severity="success">
                                File successfully uploaded to S3!
                            </Alert>
                        )}
                    </Box>
                </Paper>
            </Grid>
        </Grid>
    );
}
