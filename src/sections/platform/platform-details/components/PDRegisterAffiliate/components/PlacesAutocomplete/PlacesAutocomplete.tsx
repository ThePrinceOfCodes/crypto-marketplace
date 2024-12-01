import React, { useEffect, useRef, useState } from "react";
import TextFieldInput from "@common/components/FormInputs/TextField";
import { InputAdornment } from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import { Autocomplete } from "@react-google-maps/api";
import { useLocale } from "locale";

export interface IPlaceAutocompleteProps {

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onPlaceChange: (place: any) => void;
    location: string;
    label?: string;
    required?: boolean;
    defaultValue?: boolean;
    setLocation: React.Dispatch<React.SetStateAction<string>>
}

const PlacesAutocomplete = (props: IPlaceAutocompleteProps) => {
    const { onPlaceChange, location, setLocation, required = true, defaultValue = true, label = "Location" } = props;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const inputRef: any = useRef();
    const { text } = useLocale();

    const [sessionToken, setSessionToken] = useState<google.maps.places.AutocompleteSessionToken | null>(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onLoad = (ref: any) => {
        inputRef.current = ref;
        setSessionToken(new window.google.maps.places.AutocompleteSessionToken());
    };

    useEffect(() => {
        if (!location) {
            setSessionToken(new window.google.maps.places.AutocompleteSessionToken());
        }
    }, [location]);

    useEffect(() => {
        if (inputRef.current && sessionToken) {
            inputRef.current.setOptions({
                fields: ["formatted_address", "geometry.location"],
                componentRestrictions: { country: "kr" },
                sessionToken: sessionToken
            });
        }
    }, [sessionToken]);

    const handlePlaceChanged = () => {
        const place = inputRef.current.getPlace();
        onPlaceChange(place);
    };

    return (
        <Autocomplete
            onLoad={(ref) => onLoad(ref)}
            onPlaceChanged={handlePlaceChanged}
        >
            <TextFieldInput
                label={label}
                {...(defaultValue ? { defaultValue: location } : {})}
                value={location || ""}
                onChange={(e) => setLocation(e.target.value)}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <MyLocationIcon />
                        </InputAdornment>
                    ),
                }}
                required={required}
            />
        </Autocomplete>
    );
};

export default PlacesAutocomplete;
