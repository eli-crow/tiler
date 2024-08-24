import { useEffect } from "react";

export function usePasteImageSourceCallback(callback: (canvas: CanvasImageSource) => void) {
  useEffect(() => {
    const handler = async (event: ClipboardEvent) => {
      const clipboardData = event.clipboardData;
      if (!clipboardData) {
        return;
      }

      const items = clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        const isImage = items[i].type.indexOf("image") !== -1;
        if (isImage) {
          const imageFile = items[i].getAsFile();
          if (!imageFile) {
            throw new Error("Could not get image file from clipboard");
          }
          const imageSource: CanvasImageSource = await new Promise((resolve) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.src = URL.createObjectURL(imageFile);
          });
          callback(imageSource);
        }
      }
    };

    document.addEventListener("paste", handler);

    return () => {
      document.removeEventListener("paste", handler);
    };
  }, [callback]);
}
