"use client";

import { useEffect, useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Draggable from "react-draggable";
import html2canvas from "html2canvas";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ClipLoader from "react-spinners/ClipLoader";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";


// define type
type Meme = {
    id: string;
    name: string;
    url: string;
};

type Position = {
    x: number;
    y: number;
};

type TextBox = {
    id: number;
    text: string;
    position: Position;
    size: number;
    color: string;
    fontFamily: string;
    visible: boolean;
};

export default function MemeGenerator() {

    // State to manage the list of memes
    const [memes, setMemes] = useState<Meme[]>([]);
    // State to manage the visible memes in the carousel
    const [visibleMemes, setVisibleMemes] = useState<Meme[]>([]);
    // State to manage the selected meme
    const [selectedMeme, setSelectedMeme] = useState<Meme | null>(null);
    // state to manage textbox for text input
    const [textBoxes, setTextBoxes] = useState<TextBox[]>([]);
    // State to manage the loading state
    const [loading, setLoading] = useState<boolean>(true);
    // State to manage the loading state for loading more memes
    const [moreLoading, setMoreLoading] = useState<boolean>(false);
    // Reference to the meme div for taking a screenshot
    const memeRef = useRef<HTMLDivElement>(null);
    // Number of memes to load at a time
    const memesPerLoad = 4;
    //state to manage active textbox
    const [activeTextBoxId, setActiveTextBoxId] = useState<number | null>(null);


    const [fontFamily, setFontFamily] = useState<string>("Arial"); // default font family





    // useEffect to fetch memes from the API when the component mounts
    useEffect(() => {
        const fetchMemes = async () => {
            setLoading(true);
            const response = await fetch("https://api.imgflip.com/get_memes");
            const data = await response.json();
            setMemes(data.data.memes);
            setVisibleMemes(data.data.memes.slice(0, memesPerLoad));
            setLoading(false);
        };
        fetchMemes();
    }, []);

    // Function to load more memes into the carousel
    const loadMoreMemes = (): void => {
        setMoreLoading(true);
        const newVisibleMemes = memes.slice(0, visibleMemes.length + memesPerLoad);
        setVisibleMemes(newVisibleMemes);
        setMoreLoading(false);
    };

    // Function to handle downloading the meme as an image
    const handleDownload = async (): Promise<void> => {
        if (memeRef.current) {
            const canvas = await html2canvas(memeRef.current);
            const link = document.createElement("a");
            link.href = canvas.toDataURL("image/png");
            link.download = "meme.png";
            link.click();
        }
    };



    // Function to add a new text box
    const addTextBox = (): void => {
        setTextBoxes((prevTextBoxes) => {
           
            const newTextBox = {
                id: prevTextBoxes.length,
                text: "",
                position: { x: 0, y: 0 },
                size: 24, // default size
                color: "black", // default color
                fontFamily: fontFamily, // default font
                visible: true, // visible by default
            };
    
            setActiveTextBoxId(prevTextBoxes.length); // Set active to the new box
            return [...prevTextBoxes, newTextBox]; // Return updated text boxes array
        });
    };
    

    // Function to remove a text box
    
    const removeTextBox = (id: number) => {
        setTextBoxes((prevTextBoxes) => {
            const newTextBoxes = prevTextBoxes.slice(0, -1);

            if (activeTextBoxId !== null && activeTextBoxId >= newTextBoxes.length) {
                setActiveTextBoxId(newTextBoxes.length > 0 ? newTextBoxes.length - 1 : null);
            }

            

            return newTextBoxes;
        });
    };


    // Function to update a text box
    const updateTextBox = (id: number, key: keyof TextBox, value: string | number | Position) => {
        setTextBoxes((prevTextBoxes) =>
            prevTextBoxes.map((box) =>
                box.id === id ? { ...box, [key]: value } : box
            )
        );
    };

    // Function to toggle visibility
    const toggleTextBoxVisibility = (id: number): void => {
        if (activeTextBoxId === id) {
            setActiveTextBoxId(null); // Hide the active text box
        } else {
            setActiveTextBoxId(id); // Show the clicked text box
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 text-white p-4">
            <div className="max-w-4xl w-full px-4 py-8">
                <div className="flex flex-col items-center justify-center space-y-8">
                    {/* Header section */}
                    <div className="text-center space-y-2">
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Meme Generator</h1>
                        <p className="text-gray-400">Create custom memes with our easy-to-use generator.</p>
                    </div>
                    {/* Loading spinner or meme carousel */}
                    {loading ? (
                        <div className="flex justify-center items-center w-full h-full">
                            <ClipLoader className="w-12 h-12 text-blue-500" />
                        </div>
                    ) : (
                        <>
                            {/* Meme carousel */}
                            <div className="w-full overflow-x-scroll whitespace-nowrap py-2">
                                {visibleMemes.map((meme) => (
                                    <Card
                                        key={meme.id}
                                        className="inline-block bg-muted rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105 mx-2"
                                        onClick={() => setSelectedMeme(meme)}
                                    >
                                        <Image
                                            src={meme.url}
                                            alt={meme.name}
                                            width={300}
                                            height={300}
                                            className="object-cover w-full h-full"
                                        />
                                        <CardContent>
                                            <p className="text-center">{meme.name}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>                            {/* Load more memes button */}
                            {visibleMemes.length < memes.length && (
                                <Button
                                    onClick={loadMoreMemes}
                                    className="mt-4"
                                    disabled={moreLoading}
                                >
                                    {moreLoading ? (
                                        <ClipLoader className="w-6 h-6 text-white" />
                                    ) : (
                                        "Load More"
                                    )}
                                </Button>
                            )}
                        </>
                    )}

                    <div className="flex flex-col md:flex-row gap-7">
                        {/* Meme customization section */}
                        {selectedMeme && (
                            <Card className="w-full max-w-md bg-gray-700 border border-gray-600">
                                <CardHeader>
                                    <CardTitle>Customize Your Meme</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div ref={memeRef} className="relative bg-gray-800 rounded-lg overflow-hidden">
                                        <Image
                                            src={selectedMeme.url}
                                            alt={selectedMeme.name}
                                            width={300}
                                            height={300}
                                            className="object-cover w-full h-full"
                                        />
                                        {textBoxes.map((box) => (
                                            <Draggable
                                                key={box.id}
                                                bounds="parent"
                                                position={box.position}
                                                onDrag={(_, data) => updateTextBox(box.id, "position", { x: data.x, y: data.y })}
                                            >
                                                <div
                                                    className="absolute cursor-grab"
                                                    style={{
                                                        left: box.position.x,
                                                        top: box.position.y,
                                                        color: box.color,
                                                        fontSize: `${box.size}px`,
                                                        fontFamily: box.fontFamily,
                                                        fontWeight: "bold",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {box.text}
                                                </div>
                                            </Draggable>
                                        ))}
                                    </div>
                                    <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700" onClick={handleDownload}>
                                        Download Meme
                                    </Button>
                                    <div className="mt-4 space-x-2">
                                        <Button onClick={addTextBox} className="mb-4 bg-green-600 hover:bg-green-700">Add Text</Button>
                                        {/* Toggle visibility */}
                                        <div className="space-y-2">
                                            {textBoxes.map((box) => (
                                                <Button
                                                    key={box.id}
                                                    onClick={() => toggleTextBoxVisibility(box.id)}
                                                    variant={activeTextBoxId === box.id ? "default" : "secondary"}
                                                    className={`w-full ${activeTextBoxId === box.id ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'}`}
                                                >
                                                    {activeTextBoxId === box.id ? `Hide Text ${box.id + 1}` : `Show Text ${box.id + 1}`}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                        {/* Text box customization section */}
                        <div className="flex-1">
                            {activeTextBoxId !== null && (
                                <div key={activeTextBoxId} className="space-y-4">

                                    <Label htmlFor={`text-${activeTextBoxId}`}>Text {activeTextBoxId + 1}</Label>


                                    <Textarea
                                        value={textBoxes[activeTextBoxId]?.text || ""}
                                        onChange={(e) => updateTextBox(activeTextBoxId, "text", e.target.value)}
                                        placeholder="Enter your text here..."
                                        className="border border-gray-600 bg-gray-800 text-white"
                                    />
                                    <div className="flex space-x-4">
                                        <div className="flex flex-col">
                                            <Label>Size</Label>
                                            <Input
                                                type="range"
                                                value={textBoxes[activeTextBoxId].size}
                                                onChange={(e) => updateTextBox(activeTextBoxId, "size", parseInt(e.target.value))}
                                                className="border border-gray-600 bg-gray-800 text-white"
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <Label>Color</Label>
                                            <Input
                                                type="color"
                                                value={textBoxes[activeTextBoxId].color}
                                                onChange={(e) => updateTextBox(activeTextBoxId, "color", e.target.value)}
                                                className="border border-gray-600 bg-gray-800 rounded-full"
                                            />
                                        </div>

                                    </div>
                                    <div className="text-black">
                                        <Label className="text-white">Font Family</Label>
                                        <Select
                                            value={textBoxes[activeTextBoxId].fontFamily}
                                            onValueChange={(value) => updateTextBox(activeTextBoxId, "fontFamily", value)}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select Font Family" className="text-black fill-black">
                                                    {textBoxes[activeTextBoxId].fontFamily || "Select Font Family"}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent className="text-black">
                                                <SelectItem value="Arial">Arial</SelectItem>
                                                <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                                                <SelectItem value="Courier New">Courier New</SelectItem>
                                                <SelectItem value="Comic Sans MS">Comic Sans MS</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {/* Remove Text Box */}
                                        <Button className="mt-4 " size="sm" onClick={() => removeTextBox(activeTextBoxId)} variant="destructive">
                                            Remove
                                        </Button>
                                    </div>



                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}