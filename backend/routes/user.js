// backend/routes/user.js (Snippet)
router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("User not found");

  const validPass = await bcrypt.compare(req.body.password, user.passwordHash);
  if (!validPass) return res.status(400).send("Invalid password");

  const token = jwt.sign(
    { userId: user.id, isAdmin: user.isAdmin },
    process.env.secret,
    { expiresIn: "1d" }
  );
  res.status(200).send({ user: user.email, token: token });
});
