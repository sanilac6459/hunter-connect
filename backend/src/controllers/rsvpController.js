// Handles RSVP operations for events
const prisma = require("../prismaClient");

// RSVP to an event
const rsvpEvent = async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user.id;
  try {
    // Check if already RSVPed
    const existingRSVP = await prisma.rSVP.findFirst({
      where: { eventId: parseInt(eventId), userId },
    });
    if (existingRSVP)
      return res.status(400).json({ error: "Already RSVPed to this event." });

    const rsvp = await prisma.rSVP.create({
      data: { userId, eventId: parseInt(eventId) },
    });
    res.status(201).json(rsvp);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong." });
  }
};

// Cancel RSVP
const cancelRSVP = async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user.id;
  try {
    const rsvp = await prisma.rSVP.findFirst({
      where: { eventId: parseInt(eventId), userId },
    });
    if (!rsvp) return res.status(400).json({ error: "No RSVP found." });

    await prisma.rSVP.delete({ where: { id: rsvp.id } });
    res.json({ message: "RSVP cancelled successfully." });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong." });
  }
};

// Get all events the user has RSVPed to
const getUserRSVPs = async (req, res) => {
  const userId = req.user.id;
  try {
    const rsvps = await prisma.rSVP.findMany({
      where: { userId },
      include: {
        event: {
          include: {
            group: { select: { id: true, name: true } },
            user: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { event: { date: "asc" } },
    });
    res.json(rsvps);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong." });
  }
};

module.exports = { rsvpEvent, cancelRSVP, getUserRSVPs };
