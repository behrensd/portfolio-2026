'use client';

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import ProjectVideo from './ProjectVideo';

type MockupType = {
    type: 'video' | 'image';
    url: string;
    label: string;
};

interface ProjectCarouselProps {
    mockups: MockupType[];
}

export default function ProjectCarousel({ mockups }: ProjectCarouselProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'center' });
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
    const [nextBtnDisabled, setNextBtnDisabled] = useState(false);

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    const scrollTo = useCallback(
        (index: number) => {
            if (emblaApi) emblaApi.scrollTo(index);
        },
        [emblaApi]
    );

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
        setPrevBtnDisabled(!emblaApi.canScrollPrev());
        setNextBtnDisabled(!emblaApi.canScrollNext());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;

        onSelect();
        emblaApi.on('select', onSelect);

        return () => {
            emblaApi.off('select', onSelect);
        };
    }, [emblaApi, onSelect]);

    return (
        <div className="project-carousel-wrapper">
            <div className="embla" ref={emblaRef}>
                <div className="embla__container">
                    {mockups.map((mockup, index) => (
                        <div key={index} className="embla__slide">
                            {mockup.type === 'video' ? (
                                <ProjectVideo
                                    src={mockup.url}
                                    className="mockup-media"
                                />
                            ) : (
                                <img
                                    src={mockup.url}
                                    alt={mockup.label}
                                    className="mockup-media"
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="embla__controls">
                <div className="embla__buttons">
                    <button
                        className="embla__button"
                        onClick={scrollPrev}
                        disabled={prevBtnDisabled}
                        aria-label="Previous slide"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>
                    <button
                        className="embla__button"
                        onClick={scrollNext}
                        disabled={nextBtnDisabled}
                        aria-label="Next slide"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </button>
                </div>

                <div className="embla__dots">
                    {mockups.map((_, index) => (
                        <button
                            key={index}
                            className={`embla__dot ${
                                index === selectedIndex ? 'embla__dot--selected' : ''
                            }`}
                            onClick={() => scrollTo(index)}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
