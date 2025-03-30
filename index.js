import http from 'http';
import path from 'path';
import { spawn } from 'child_process';
import express from 'express';
import { Server as SocketIO } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new SocketIO(server);

const options = [
    '-i', '-',
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-tune', 'zerolatency',
    '-r', '25',
    '-g', '50',
    '-keyint_min', '25',
    '-crf', '25',
    '-pix_fmt', 'yuv420p',
    '-sc_threshold', '0',
    '-profile:v', 'main',
    '-level', '3.1',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-ar', '32000',
    '-f', 'flv',
    `rtmp://a.rtmp.youtube.com/live2/at8v-5sgk-rrsq-vd49-9t31`
];

const ffmpegProcess = spawn('ffmpeg', options);

// Logging FFmpeg Output for Debugging
ffmpegProcess.stdout.on('data', (data) => {
    console.log(`FFmpeg stdout: ${data.toString()}`);
});

ffmpegProcess.stderr.on('data', (data) => {
    console.error(`FFmpeg stderr: ${data.toString()}`);
});

// Handle FFmpeg Process Closure
ffmpegProcess.on('close', (code) => {
    console.error(`FFmpeg process exited with code ${code}`);
});

ffmpegProcess.on('error', (err) => {
    console.error('FFmpeg Process Error:', err.message);
});

app.use(express.static(path.resolve('./public')));

io.on('connection', (socket) => {
    console.log('Socket Connected:', socket.id);

    socket.on('binarystream', (stream) => {
        console.log('Binary Stream Incoming...');

        if (!Buffer.isBuffer(stream)) {
            console.error('Received stream is not a buffer');
            return;
        }

        if (!ffmpegProcess.stdin.writable) {
            console.error('FFmpeg stdin is not writable.');
            return;
        }

        ffmpegProcess.stdin.write(stream, (err) => {
            if (err) {
                console.error('FFmpeg stdin write error:', err.message);
            }
        });
    });

    socket.on('disconnect', () => {
        console.log(`Socket Disconnected: ${socket.id}`);
    });
});

server.listen(3000, () => {
    console.log('HTTP server is running on port 3000');
});
