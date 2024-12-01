import React, { useState } from "react";
import Image from "next/image";

interface Props {
    src: string;
    height?: number;
    width?: number;
    className?: string;
    alt: string;
}

const CustomImage = ({ src, height = 40, width = 40, className = "h-10 w-10 rounded-full", alt }: Props) => {
    const [imageLoading, setImageLoading] = useState(true);
    const [imgSrc, setImgSrc] = useState(src);

    const handleImageLoad = () => {
        setImageLoading(false);
    };

    const handleImageError = () => {
        setImageLoading(false);
        setImgSrc("/images/placeholder.svg");
    };

    return (
        <div>
            <Image
                src={imgSrc}
                height={height}
                width={width}
                alt={alt}
                onLoad={handleImageLoad}
                onError={handleImageError}
                className={`${imageLoading ? "shimmer" : "bg-gray-100"}  ${className}`}
            />
        </div>
    );
};

export default CustomImage;
