import {useEffect, useMemo, useState} from "react";
import {Autocomplete, Grid, TextField} from "@mui/material";
import countries from 'i18n-iso-countries';
import english from "i18n-iso-countries/langs/en.json";

// Importing large JSON files is far from an ideal solution.
// In the future, we should consider a more efficient way to store and query this data, e.g. using a database or an API.
import admin1 from '../../data/adm1_parsed_data.json';
import admin2 from '../../data/adm2_parsed_data.json';
import admin3 from '../../data/adm3_parsed_data.json';


type AdminEntry = {
    name: string;
    wiki: string;
};

export default function LocationAdminExplorer() {
    useEffect(() => {
        countries.registerLocale(english);
    }, []);

    const countryNames = countries.getNames('en');
    const [admin1Entries, setAdmin1Entries] = useState<AdminEntry[] | null>(null);
    const [admin2Entries, setAdmin2Entries] = useState<AdminEntry[] | null>(null);
    const [admin3Entries, setAdmin3Entries] = useState<AdminEntry[] | null>(null);

    const [selectedCountry, setSelectedCountry] = useState<string>('');
    const [selectedAdmin1, setSelectedAdmin1] = useState<AdminEntry>({name: '', wiki: ''},);
    const [selectedAdmin2, setSelectedAdmin2] = useState<AdminEntry>({name: '', wiki: ''},);
    const [selectedAdmin3, setSelectedAdmin3] = useState<AdminEntry>({name: '', wiki: ''},);

    useEffect(() => {
        const countryCode: string = countries.getAlpha3Code(selectedCountry, "en") || '';
        if (countryCode && countryCode in admin1) {
            setAdmin1Entries(admin1[countryCode as keyof typeof admin1]);
        } else {
            setAdmin1Entries(null);
        }
        setSelectedAdmin1({name: '', wiki: ''});
    }, [selectedCountry]);

    useEffect(() => {
        if (selectedAdmin1.wiki) {
            if (selectedAdmin1.wiki in admin2) setAdmin2Entries(admin2[selectedAdmin1.wiki as keyof typeof admin2]);
        } else {
            setAdmin2Entries(null);
        }
        setSelectedAdmin2({name: '', wiki: ''});
    }, [selectedAdmin1.wiki]);


    useEffect(() => {
        if (selectedAdmin2.wiki && selectedAdmin2.wiki in admin3)
            setAdmin3Entries(admin3[selectedAdmin2.wiki as keyof typeof admin3]);
        else
            setAdmin3Entries(null);

        setSelectedAdmin3({name: '', wiki: ''});
    }, [selectedAdmin2.wiki]);


    return <Grid container spacing={2}>
        <Grid size={12}>
            <h2>Admin Location Explorer</h2>
            <p>This explorer is based on Mapbox Boundaries v3. It helps to use recognizable admin area names and
                relations between them. </p>
            <p>We use <b>iso3</b> code for identifying Admin0 Areas (e.g. countries) and <b>wikidata</b> to identify
                Admin1 (e.g. state), Admin2 (e.g. county) and admin3 (e.g. township) areas for the G.h map
                visualizations. Areas available for the G.h map views are indicated with 🌎 before the admin area name.
            </p>
        </Grid>
        <Grid size={6}>
            <Autocomplete
                getOptionLabel={(option: string): string => option && `🌎 ${option}`}
                options={Object.keys(countryNames)
                    .map((alpha2key) => countryNames[alpha2key])
                    .sort()}
                value={selectedCountry}
                disableClearable
                onChange={(_: unknown, newValue: string | null,): void => {
                    setSelectedCountry(newValue || '');
                }}
                renderInput={(params) => <TextField {...params} label="Admin0"/>}
            />
        </Grid>
        <Grid size={6}>
            <p><b>iso3</b>: {countries.getAlpha3Code(selectedCountry, "en") || 'N/A'}</p>
        </Grid>
        <Grid size={6}>
            <Autocomplete
                getOptionLabel={(option: AdminEntry): string => `${option.wiki && "🌎 "}${option.name}`}
                options={admin1Entries || []}
                value={selectedAdmin1}
                onChange={(_: unknown, newValue: AdminEntry | null,): void => {
                    setSelectedAdmin1(newValue || {name: '', wiki: ''});
                }}
                onInputChange={(_e, _v, reason): void => {
                    reason === 'clear' && setSelectedAdmin1({name: '', wiki: ''});
                }}
                noOptionsText="No Admin1 locations are represented on the map for the given Country"
                renderInput={(params) => <TextField {...params} label="Admin1"/>}
            />
        </Grid>
        <Grid size={6}>
            <p><b>wikidata</b>: {selectedAdmin1?.wiki || 'N/A'}</p>
        </Grid>
        <Grid size={6}>
            <Autocomplete
                getOptionLabel={(option: AdminEntry): string => `${option.wiki && "🌎 "}${option.name}`}
                options={admin2Entries || []}
                value={selectedAdmin2}
                onChange={(_: unknown, newValue: AdminEntry | null,): void => {
                    setSelectedAdmin2(newValue || {name: '', wiki: ''});
                }}
                onInputChange={(_e, _v, reason): void => {
                    reason === 'clear' && setSelectedAdmin2({name: '', wiki: ''});
                }}
                noOptionsText="No Admin2 locations are represented on the map for the given Admin1"
                renderInput={(params) => <TextField {...params} label="Admin2"/>}
            />
        </Grid>
        <Grid size={6}>
            <p><b>wikidata</b>: {selectedAdmin2?.wiki || 'N/A'}</p>
        </Grid>
        <Grid size={6}>
            <Autocomplete
                getOptionLabel={(option: AdminEntry): string => `${option.wiki && "🌎 "}${option.name}`}
                options={admin3Entries || []}
                value={selectedAdmin3}
                onChange={(_: unknown, newValue: AdminEntry | null,): void => {
                    setSelectedAdmin3(newValue || {name: '', wiki: ''});
                }}
                onInputChange={(_e, _v, reason): void => {
                    reason === 'clear' && setSelectedAdmin3({name: '', wiki: ''});
                }}
                noOptionsText="No Admin3 locations are represented on the map for the given Admin2"
                renderInput={(params) => <TextField {...params} label="Admin3"/>}
            />
        </Grid>
        <Grid size={6}>
            <p><b>wikidata</b>: {selectedAdmin3?.wiki || 'N/A'}</p>
        </Grid>
    </Grid>
}