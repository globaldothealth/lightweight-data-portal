"""Small country-name to ISO3 helper for outbreaks that only need a limited mapping."""

COUNTRY_NAME_TO_ISO3 = {
    'Democratic Republic of the Congo': 'COD',
    'DR Congo': 'COD',
    'Congo, The Democratic Republic of the': 'COD',
    'Uganda': 'UGA',
    'France': 'FRA',
}


def to_iso3(country_name):
    if not country_name:
        return ''

    cleaned = country_name.strip()
    if len(cleaned) == 3 and cleaned.isalpha():
        return cleaned.upper()

    return COUNTRY_NAME_TO_ISO3.get(cleaned, cleaned.upper())

