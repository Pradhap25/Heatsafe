from fastapi import APIRouter, HTTPException, status
from app.schemas.assistant import AssistantMessageRequest, AssistantMessageResponse
from app.services.assistant_service import AssistantService

router = APIRouter(prefix="/assistant", tags=["Bilingual Voice Safety Assistant"])


@router.post("/message", response_model=AssistantMessageResponse)
async def ask_assistant(req: AssistantMessageRequest):
    """
    Receives bilingual (Tamil/English) query from speech recognition or text input.
    Performs deterministic life-safety emergency screening first.
    Retrieves guidance from curated public-health & occupational knowledge base.
    Returns structured text and speech synthesis string for browser TTS.
    """
    if not req.message or not req.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message content cannot be empty"
        )

    try:
        response = await AssistantService.process_user_query(
            message=req.message.strip(),
            preferred_lang=req.language
        )
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Safety assistant error: {str(e)}"
        )
