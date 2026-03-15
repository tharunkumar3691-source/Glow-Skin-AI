import { Router, type IRouter } from "express";
import healthRouter from "./health";
import skinRouter from "./skin";
import treatmentRouter from "./treatment";
import environmentalRouter from "./environmental";
import voiceRouter from "./voice";
import habitCoachRouter from "./habitCoach";

const router: IRouter = Router();

router.use(healthRouter);
router.use(skinRouter);
router.use(treatmentRouter);
router.use(environmentalRouter);
router.use(voiceRouter);
router.use(habitCoachRouter);

export default router;
