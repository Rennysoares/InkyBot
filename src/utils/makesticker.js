import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';
ffmpeg.setFfmpegPath(ffmpegPath.path);

export const makeSticker = async(params, filePathIn, filePathOut)=>{

    const formatCommands = ["fs", "fsticker"];
    
    const options = formatCommands.includes(params.command) ?
            [
                `-vcodec`, `libwebp`, `-vf`,
                `scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`] :
            [
                `-vcodec`, `libwebp`, `-vf`,
                `scale=320:320,fps=15`];

        await new Promise((resolve, reject) => {
            ffmpeg(filePathIn)
                .format("webp")
                .addOutputOptions(options)
                .on("error", (err) => reject(err))
                .on("end", () => resolve(filePathOut))
                .save(filePathOut);
        });
}