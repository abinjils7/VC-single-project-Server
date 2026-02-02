import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { createPitch, getPitchesForInvestor, getStartupPitches, updatePitchStatus } from "../Controllers/PitchController";

const router = express.Router();


const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

router.post("/create", upload.single("video"), createPitch);
router.get("/investor/:investorId", getPitchesForInvestor);
router.get("/startup/:startupId", getStartupPitches);
router.put("/status/:pitchId", updatePitchStatus);

export default router;
