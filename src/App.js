import './App.css';
import { useCallback, useRef, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

function App() {
  const inputRef = useRef(null);
  const TICKET_STATUSES = ["todo", "in-progress", "completed", "qa"];

  const getAllTicketsFromStorage = () => {
    const foundTickets = localStorage.getItem("stored-tickets");
    return foundTickets ? JSON.parse(foundTickets) : [];
  };

  const [tickets, setTickets] = useState(getAllTicketsFromStorage());

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = inputRef.current.value;

    if (!value) return;
    createTicket(value);
    inputRef.current.value = "";
  };

  const updateTickets = useCallback((netTickets) => {
    localStorage.setItem("stored-tickets", JSON.stringify(netTickets));
    setTickets(netTickets);
  }, []);

  const createTicket = (newLabel) => {
    const newTicket = {
      id: crypto.randomUUID(),
      label: newLabel,
      status: 'todo',
    };
    updateTickets([...tickets, newTicket]);
  };

  const getTicketsPerStatus = useCallback((status) => {
    return tickets.filter(ticket => ticket.status === status);
  }, [tickets]);

  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) return;

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return
    }

    const sourceStatus = source.droppableId;
    const destStatus = destination.droppableId;

    const newTickets = [...tickets]

    const sourceTicketColum = newTickets?.filter((ticket) => ticket.status === source.droppableId)

    const [movedTicket] = sourceTicketColum?.filter((item) => item?.id == result.draggableId)
    movedTicket.status = destStatus;

    const updatedTickets = [...newTickets.filter((ticket) => ticket.id !== movedTicket.id), movedTicket]



    updateTickets(updatedTickets);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="App">
        <h1>This is Todo List</h1>
        <div className='addtodo-input'>
          <form onSubmit={handleSubmit}>
            <input type='text' ref={inputRef} />
            <button type='submit'>Add</button>
          </form>
        </div>
        <div className='ticket-box'>
          <div className='flex-ticketBox'>
            {TICKET_STATUSES.map((status) => (
              <Droppable droppableId={status} key={status}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className='todo'>
                    <p>{status}</p>
                    {getTicketsPerStatus(status).map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className='ticket-box'>
                            <h1>{status}-ticket</h1>
                            <p>{item.label}</p>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </div>
      </div>
    </DragDropContext>
  );
}

export default App;
