import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const templates = {
  retail: {
    name: 'Retail Product Detection',
    curriculum: [{ stage: 1, epochs: 1 }, { stage: 2, epochs: 3 }, { stage: 3, epochs: 2 }],
  },
  street: {
    name: 'Street Sign Recognition',
    curriculum: [{ stage: 1, epochs: 1 }, { stage: 2, epochs: 4 }, { stage: 3, epochs: 2 }],
  },
  medical: {
    name: 'Medical X-Ray Captioning',
    curriculum: [{ stage: 1, epochs: 2 }, { stage: 2, epochs: 3 }, { stage: 3, epochs: 3 }],
  },
};

export default function CurriculumConfigurator({ value, onChange }) {
  const handleTemplate = (key) => {
    onChange(templates[key].curriculum);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(value);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    onChange(items);
  };

  const updateEpochs = (idx, epochs) => {
    const items = [...value];
    items[idx].epochs = epochs;
    onChange(items);
  };

  return (
    <div className="space-y-2">
      <label className="font-semibold text-sm">Curriculum Stages</label>
      <select
        className="input-field"
        onChange={(e) => handleTemplate(e.target.value)}
        defaultValue=""
      >
        <option value="" disabled>
          Choose a template
        </option>
        {Object.entries(templates).map(([key, tpl]) => (
          <option key={key} value={key}>
            {tpl.name}
          </option>
        ))}
      </select>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="curriculum">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
              {value.map((stage, idx) => (
                <Draggable key={idx} draggableId={`${idx}`} index={idx}>
                  {(prov) => (
                    <div
                      ref={prov.innerRef}
                      {...prov.draggableProps}
                      {...prov.dragHandleProps}
                      className="glass-card p-3 flex items-center justify-between"
                    >
                      <span className="font-medium">Stage {stage.stage}</span>
                      <input
                        type="number"
                        min="1"
                        className="w-20 input-field text-xs"
                        value={stage.epochs}
                        onChange={(e) => updateEpochs(idx, Number(e.target.value))}
                      />
                      <span className="text-xs text-gray-500">epochs</span>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
} 