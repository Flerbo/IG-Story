const fs = require("fs");
const { createCanvas, loadImage } = require('canvas');

const params = {
    input: './stickers',
    sticker: {
        size: 400,
        shadow: {
            color: 'rgba(0, 0, 0, 0.2)',
            offset: 5,
            blur: 8,
        },
    },
    variations: {
        copies: 15,
        rotate: [0, 10, 10, 15, 20, 20, 25, 30, 30, 35, 40, 40, 45, 50, 60],
    },
    mask: {
        radius: 300
    },
    background: '#e4e4e4',
    output: {
        name: 'flerbo',
        width: 1080,
        height: 1920,
        extension: 'png',
    },
}

let canvas = createCanvas(params.output.width, params.output.height, params.output.extension);

scanStickers = (path ) => {
    return new Promise ((resolve, reject) => {
        resolve(fs.readdirSync(path));
    })
};

addStickerToStory = (filePath) => {
    let ctx = canvas.getContext("2d");
    // Select Random Degree (Negative or Positive)
    const randomRotate = params.variations.rotate[Math.floor(Math.random() * params.variations.rotate.length)] * (Math.round(Math.random()) * 2 - 1);

    // Select Random Position
    const randomRadian = Math.random() * 2 * Math.PI;
    const randomRadius = Math.random() * Math.pow(params.mask.radius, 2);
    const randomX = Math.sqrt(randomRadius) * Math.cos(randomRadian);
    const randomY = (Math.sqrt(randomRadius) * Math.sin(randomRadian)) + (Math.round(Math.random() * 3) * (params.mask.radius / 2));

    loadImage(filePath).then((image) => {
    

        ctx.save();

        // Move Pivot Point To Center
        ctx.translate((canvas.width / 2) + randomX, (canvas.width / 2) + randomY);

        // Rotate
        ctx.rotate(randomRotate * (Math.PI / 180));

        // Reset Pivot Point
        ctx.translate(0, 0);

        // Create Shadow
        ctx.shadowColor = params.sticker.shadow.color;
        ctx.shadowBlur = params.sticker.shadow.blur;
        ctx.shadowOffsetX = (params.sticker.shadow.offset * Math.cos(randomRotate * (Math.PI / 180))) +
                            (params.sticker.shadow.offset * Math.sin(randomRotate * (Math.PI / 180)));
        ctx.shadowOffsetY = (-1 * params.sticker.shadow.offset * Math.sin(randomRotate * (Math.PI / 180))) +
                            (params.sticker.shadow.offset * Math.cos(randomRotate * (Math.PI / 180)));

        // Draw Image From Center
        ctx.drawImage(image,
            params.sticker.size / -2,
            params.sticker.size / -2,
            params.sticker.size,
            params.sticker.size,
        );

        ctx.restore();
    });
}

addBackgroundToStory = (background) => {
    let ctx = canvas.getContext("2d");

    // Draw Background
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

}

downloadStory = (fileName) => {
    fs.writeFileSync(fileName, canvas.toBuffer());
}

addBackgroundToStory(params.background);
scanStickers(params.input).then(stickers => {
    Array(params.variations.copies)
        .fill([...stickers])
        .reduce((a, b) => a.concat(b))
        .sort(() => Math.random() - 0.5)
        .forEach(sticker => {
            addStickerToStory(`${params.input}/${sticker}`);
        });
}).then(() => {
    downloadStory(`${params.output.name}.${params.output.extension}`);
})

