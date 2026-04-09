import {useState} from 'react'
import {Accordion, AccordionSummary, Link, Typography} from "@mui/material";

interface DataAcknowledgementsAccordionProps {
    initialOpen: boolean;
}

export const DataAcknowledgementsAccordion = (props: DataAcknowledgementsAccordionProps) => {
    const [isOpen, setIsOpen] = useState(props.initialOpen);

    return (<Accordion expanded={isOpen}>
        <AccordionSummary sx={{
            '& .Mui-expanded': {
                m: '1.2rem 0 1.2rem 0',
            }, '& span': {
                m: '1.2rem 0 1.2rem 0',
            }
        }}>
            <Typography sx={{textAlign: 'justify'}}>By accessing or using the datasets, you acknowledge that
                you have read, understood, and agreed
                to comply with <Link
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(!isOpen)
                    }}
                >data handling terms.</Link></Typography>
        </AccordionSummary>
        <Typography sx={{textAlign: 'justify', p: '0 1rem 1rem 1rem', fontStyle: 'italic'}}>
            By accessing or downloading these datasets, you agree to handle the data responsibly and in
            accordance with the ethical research and data protection standards outlined in the Global.health
            Terms of Use, Privacy Policy, and Code of Conduct. The data are provided for research purposes
            only, and users may not attempt to re-identify individuals. While reasonable efforts are made to
            ensure accuracy, the data are subject to ongoing verification and may be updated or revised.
            Global.health makes no warranties regarding the accuracy or completeness of the data and
            disclaims liability for any use of, or reliance on, the information. Users are responsible for
            the interpretation, analysis, and use of the data and any outputs derived from it.
        </Typography>
        <Typography sx={{textAlign: 'justify', p: '0 1rem 1rem 1rem', fontStyle: 'italic'}}>
            Please cite as: "Global.health Data [Outbreak] (accessed on YYYY-MM-DD)"
        </Typography>
    </Accordion>)
}
