// Handles CRUD operations for events within a group
const prisma = require("../prismaClient");

// Get all events in a group
const getEventsByGroup = async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user.id;
  try {
    // Check if user is a member of the group
    const membership = await prisma.membership.findFirst({
      where: { groupId: parseInt(groupId), userId },
    });
    if (!membership)
      return res.status(403).json({ error: "Not a member of this group." });

    const events = await prisma.event.findMany({
      where: { groupId: parseInt(groupId) },
      include: {
        user: { select: { id: true, name: true } },
        rsvps: { select: { userId: true } },
      },
      orderBy: { date: "asc" },
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong." });
  }
};

// Create an event in a group — only members can create
const createEvent = async (req, res) => {
  const { groupId } = req.params;
  const { title, description, date, location } = req.body;
  const userId = req.user.id;
  try {
    // Check if user is a member
    const membership = await prisma.membership.findFirst({
      where: { groupId: parseInt(groupId), userId },
    });
    if (!membership)
      return res.status(403).json({ error: "Not a member of this group." });

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        location,
        userId,
        groupId: parseInt(groupId),
      },
    });
    res.status(201).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
};

// Update an event — only the creator can update
const updateEvent = async (req, res) => {
  const { id } = req.params;
  const { title, description, date, location } = req.body;
  const userId = req.user.id;
  try {
    const event = await prisma.event.findUnique({
      where: { id: parseInt(id) },
    });
    if (!event) return res.status(404).json({ error: "Event not found." });
    if (event.userId !== userId)
      return res.status(403).json({ error: "Not authorized." });

    const updated = await prisma.event.update({
      where: { id: parseInt(id) },
      data: { title, description, date: new Date(date), location },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong." });
  }
};

// Delete an event — only the creator can delete
const deleteEvent = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    const event = await prisma.event.findUnique({
      where: { id: parseInt(id) },
    });
    if (!event) return res.status(404).json({ error: "Event not found." });
    if (event.userId !== userId)
      return res.status(403).json({ error: "Not authorized." });

    // Delete RSVPs first
    await prisma.rSVP.deleteMany({ where: { eventId: parseInt(id) } });
    await prisma.event.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Event deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong." });
  }
};

module.exports = { getEventsByGroup, createEvent, updateEvent, deleteEvent };
