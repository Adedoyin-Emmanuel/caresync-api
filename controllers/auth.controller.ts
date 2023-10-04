class AuthController {
  //     static async  register(req: Request, res: Response) {
  //     const schema = Joi.object({
  //       email: Joi.string().email().required(),
  //       password: Joi.string().required(),
  //     });
  //   }
  //   static async  login(req: Request, res: Response) {
  //     const schema = Joi.object({
  //       email: Joi.string().email().required(),
  //       password: Joi.string().required(),
  //     });
  //     const { error } = schema.validate(req.body);
  //     const { email, password } = req.body;
  //     const user = await User.findOne({ email });
  //     if (!user) {
  //       return res.status(400).json({ error: "Invalid email or password" });
  //     }
  //     const validPassword = await bcrypt.compare(password, user.password);
  //     if (!validPassword) {
  //       return res.status(400).json({ error: "Invalid email or password" });
  //     }
  //     const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET!);
  //     res.header("auth-token", token).json({ token });
  //   }
}
