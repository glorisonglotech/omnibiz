const express = require("express");
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();
const {
  createTeamMember,
  getAllTeamMembers,
  getTeamMemberById,
  updateTeamMember,
  deleteTeamMember,
} = require("../controllers/teamController");

router.post('/',protect,createTeamMember);
router.get('/',protect,getAllTeamMembers);
router.get('/:id',protect,getTeamMemberById);
router.put('/:id',protect,updateTeamMember);
router.delete('/:id',protect,deleteTeamMember);

module.exports = router;

