'use server';
export const getRoomChats = async (roomId: string) => {
  try {
    const room = await liveblocks.getRoom(roomId);
    if (!room || !room.metadata || !('chats' in room.metadata)) {
      return [];
    }
    return room.metadata.chats || [];
  } catch (error) {
    console.log(`Error getting chats for room: ${error}`);
    return [];
  }
};

export const updateRoomChats = async (roomId: string, chats: any[]) => {
  try {
    const room = await liveblocks.getRoom(roomId);
    const { id, defaultAccesses, tasks, ...rest } = room.metadata || {};
    const newMetadata = { id, defaultAccesses, tasks, ...rest, chats };
    const updatedRoom = await liveblocks.updateRoom(roomId, {
      metadata: newMetadata
    });
    revalidatePath(`/documents/${roomId}`);
    return updatedRoom.metadata.chats;
  } catch (error) {
    console.log(`Error updating chats for room: ${error}`);
    return [];
  }
};

export const getRoomTasks = async (roomId: string) => {
  try {
    const room = await liveblocks.getRoom(roomId);
    if (!room || !room.metadata || !('tasks' in room.metadata)) {
      return [];
    }
    return room.metadata.tasks || [];
  } catch (error) {
    console.log(`Error getting tasks for room: ${error}`);
    return [];
  }
};

// Update tasks for a room
export const updateRoomTasks = async (roomId: string, tasks: any[]) => {
  try {
    const room = await liveblocks.getRoom(roomId);
    const { id, defaultAccesses, ...rest } = room.metadata || {};
    const newMetadata = { id, defaultAccesses, ...rest, tasks };
    const updatedRoom = await liveblocks.updateRoom(roomId, {
      metadata: newMetadata
    });
    revalidatePath(`/documents/${roomId}`);
    return updatedRoom.metadata.tasks;
  } catch (error) {
    console.log(`Error updating tasks for room: ${error}`);
    return [];
  }
};

import { nanoid } from 'nanoid'
import { liveblocks } from '../liveblocks';
import { revalidatePath } from 'next/cache';
import { getAccessType, parseStringify } from '../utils';
import { redirect } from 'next/navigation';

export const createDocument = async ({ userId, email }: CreateDocumentParams) => {
  const roomId = nanoid();

  try {
    const metadata = {
      creatorId: userId,
      email,
      title: 'Untitled'
    }

    const usersAccesses: RoomAccesses = {
      [email]: ['room:write']
    }

    const room = await liveblocks.createRoom(roomId, {
      metadata,
      usersAccesses,
      defaultAccesses: []
    });
    
    revalidatePath('/');

    return parseStringify(room);
  } catch (error) {
    console.log(`Error happened while creating a room: ${error}`);
  }
}

export const getDocument = async ({ roomId, userId }: { roomId: string; userId: string }) => {
  try {
      const room = await liveblocks.getRoom(roomId);
    
      const hasAccess = Object.keys(room.usersAccesses).includes(userId);
    
      if(!hasAccess) {
        throw new Error('You do not have access to this document');
      }
    
      return parseStringify(room);
  } catch (error) {
    console.log(`Error happened while getting a room: ${error}`);
  }
}

export const updateDocument = async (roomId: string, title: string) => {
  try {
    const updatedRoom = await liveblocks.updateRoom(roomId, {
      metadata: {
        title
      }
    })

    revalidatePath(`/documents/${roomId}`);

    return parseStringify(updatedRoom);
  } catch (error) {
    console.log(`Error happened while updating a room: ${error}`);
  }
}

export const getDocuments = async (email: string ) => {
  try {
      const rooms = await liveblocks.getRooms({ userId: email });
    
      return parseStringify(rooms);
  } catch (error) {
    console.log(`Error happened while getting rooms: ${error}`);
  }
}

export const updateDocumentAccess = async ({ roomId, email, userType, updatedBy }: ShareDocumentParams) => {
  try {
    const usersAccesses: RoomAccesses = {
      [email]: getAccessType(userType) as AccessType,
    }

    const room = await liveblocks.updateRoom(roomId, { 
      usersAccesses
    })

    if(room) {
      const notificationId = nanoid();

      await liveblocks.triggerInboxNotification({
        userId: email,
        kind: '$documentAccess',
        subjectId: notificationId,
        activityData: {
          userType,
          title: `You have been granted ${userType} access to the document by ${updatedBy.name}`,
          updatedBy: updatedBy.name,
          avatar: updatedBy.avatar,
          email: updatedBy.email
        },
        roomId
      })
    }

    revalidatePath(`/documents/${roomId}`);
    return parseStringify(room);
  } catch (error) {
    console.log(`Error happened while updating a room access: ${error}`);
  }
}

export const removeCollaborator = async ({ roomId, email }: {roomId: string, email: string}) => {
  try {
    const room = await liveblocks.getRoom(roomId)

    if(room.metadata.email === email) {
      throw new Error('You cannot remove yourself from the document');
    }

    const updatedRoom = await liveblocks.updateRoom(roomId, {
      usersAccesses: {
        [email]: null
      }
    })

    revalidatePath(`/documents/${roomId}`);
    return parseStringify(updatedRoom);
  } catch (error) {
    console.log(`Error happened while removing a collaborator: ${error}`);
  }
}

export const deleteDocument = async (roomId: string) => {
  try {
    await liveblocks.deleteRoom(roomId);
    revalidatePath('/');
    redirect('/');
  } catch (error) {
    console.log(`Error happened while deleting a room: ${error}`);
  }
}