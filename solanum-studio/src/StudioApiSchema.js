export const getComponentPaths = {
    type: 'object',
    required: false,
    properties: {}
}

export const openComponent = {
    type: 'object',
    required: true,
    properties: {
        module:         {type: 'string', required: true},
        component:      {type: 'string', required: true},
    }
}

export const childPosition = {
    type: 'object',
    required: true,
    properties: {
        left:           {type: 'string', required: false},
        right:          {type: 'string', required: false},
        top:            {type: 'string', required: false},
        bottom:         {type: 'string', required: false},
        width:          {type: 'string', required: false},
        height:         {type: 'string', required: false},
    }
}

export const addChildComponent = {
    type: 'object',
    properties: {
        module:         {type: 'string', required: true},
        component:      {type: 'string', required: true},
        childId:        {type: 'string', required: true},
        childClassName: {type: 'string', required: true},
        childPath:      {type: 'string', required: true},
        position:       childPosition,
    }
}

export const removeChildComponent = {
    type: 'object',
    properties: {
        module:         {type: 'string', required: true},
        component:      {type: 'string', required: true},
        childId:        {type: 'string', required: true},
    }
}

export const setChildPosition = {
    type: 'object',
    properties: {
        module:         {type: 'string', required: true},
        component:      {type: 'string', required: true},
        childId:        {type: 'string', required: true},
        position:       childPosition,
    }
}

export const setChildEventHandler = {
    type: 'object',
    properties: {
        module:         {type: 'string', required: true},
        component:      {type: 'string', required: true},
        childId:        {type: 'string', required: true},
        eventId:        {type: 'string', required: true},
        eventHandler:   {type: 'string', required: true},
    }
}

export const removeChildEventHandler = {
    type: 'object',
    properties: {
        module:         {type: 'string', required: true},
        component:      {type: 'string', required: true},
        childId:        {type: 'string', required: true},
        eventId:        {type: 'string', required: true},
    }
}